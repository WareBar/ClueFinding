from django.shortcuts import render
from User.models import User
from User.serializers import UserSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
# Create your views here.
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
import traceback
from utils import send_email
from User.models import User

class UserViewset(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['create']: #regiser new user
            permission_classes = [AllowAny] #no auth required when someone wants to register
        elif self.action in ['retrieve','update','partial_update','destroy']:
            permission_classes = [IsAuthenticated]
        elif self.action in ['list']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        # Non-admins can only see their own profile
        user = self.request.user
        if user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    
    # to hash the user password when registering
    def perform_create(self, serializer):
        user = serializer.save()
        user.set_password(user.password)
        user.save()

    # to verify the code rece3ived from the front-end
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def verify_code(self, request):
        user = request.user 
        code = request.data.get('code')
        resend = request.data.get('resend',False)

        if user.is_verified:
            return Response({'message':f"{user.email} is already verified"})

        if resend:
            # Check cooldown (1 minute)
            if user.code_created_at and timezone.now() - user.code_created_at < timedelta(minutes=1):
                remaining = 60 - int((timezone.now() - user.code_created_at).total_seconds())
                return Response(
                    {'error': f'Please wait {remaining}s before requesting a new code.'},
                    status=429  # Too Many Requests
                )

            user.generate_verification_code()
            user.code_created_at = timezone.now()  # update timestamp
            user.save()
            try:
                send_email(
                    subject="Email Verification",
                    to=[user.email],  # MUST be a list
                    template="emails/email_verification.html",  # MUST be template path
                    context={
                        "first_name":user.first_name,
                        "last_name":user.last_name,
                        "verification_code":user.verification_code
                    }
                )
            except Exception as e:
                print(f"Email sending failed for {user.email}: {e}")
                traceback.print_exc()
            return Response({'message':'Email verification code resent'})

        if not code:
                # Email check is no longer needed since we have the user object
                return Response({'error': 'Verification code is required.'}, status=400)
        if user.is_code_valid(code):
            user.is_active = True
            user.is_verified = True
            user.verification_code = None
            user.code_created_at = None
            user.save()
            return Response({'message': 'Email verified successfully!'})
        return Response({'error': 'Invalid or expired code.'}, status=400)
    
    
    @action(detail=False, methods=["post"], permission_classes=[AllowAny], url_path="forgot-password")
    def forgot_password(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'message': 'If an account exists for this email, a reset code has been sent.'})
        
        user.generate_verification_code()
        try:
            send_email(
                subject="Reset your Flavors of Quezon password",
                to=[user.email],
                template="emails/password_reset.html",
                context={
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "verification_code": user.verification_code,
                    "year": timezone.now().year
                }
            )
        except Exception as e:
            print(f"Password reset email failed for {user.email}: {e}")
        
        return Response({'message': 'If an account exists for this email, a reset code has been sent.'})


    @action(detail=False, methods=["post"], permission_classes=[AllowAny], url_path="reset-password")
    def reset_password(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')

        if not all([email, code, new_password, confirm_password]):
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid email or reset code.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_code_valid(code):
            return Response({'error': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.verification_code = None
        user.code_created_at = None
        user.save()

        return Response({'message': 'Password reset successful. You can now log in.'})


# handle the  google login
# this login if that user does not exist, and auto register the user using google info
# in get_or_create

class GoogleOAuthLogin(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        token = request.data.get('token')
        try:
            # Verify Google token
            idinfo = id_token.verify_oauth2_token(token, requests.Request())
            email = idinfo['email']
            name = idinfo.get('name', email.split('@')[0])
            picture = idinfo.get('picture', '')

            # Create or get user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': name,
                    'avatar':picture,
                    'is_verified':True
                }
            )

            # Issue JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'avatar': picture,
                }
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)