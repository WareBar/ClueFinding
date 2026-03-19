from django.urls import path, include
from rest_framework.routers import DefaultRouter
from User.views import UserViewset
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView 
from User.views import UserViewset, GoogleOAuthLogin

router = DefaultRouter()
router.register("user",UserViewset,basename="users")

urlpatterns = [
    path("", include(router.urls)),
    path('auth/google/', GoogleOAuthLogin.as_view(), name='google_oauth'),
    path('auth/token/', TokenObtainPairView.as_view(), name="get_token"),
    path('auth/token/refresh', TokenRefreshView.as_view(), name="refresh_token"),
    path('auth/', include('rest_framework.urls'))
]



