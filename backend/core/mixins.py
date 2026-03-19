from core.validators import DateRangeValidator
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

class DateFilterViewSetMixin:
    date_field = "created_at"

    def filter_queryset(self, qs):
        # First, let other backends filter (status, is_featured, etc.)
        qs = super().filter_queryset(qs)

        # Then apply date filter
        params = self.request.query_params
        start_date = params.get("start_date")
        end_date = params.get("end_date")


        DateRangeValidator.validate(start_date, end_date)
        return qs.between(self.date_field, start_date, end_date)

 
class PermissionMixin:
    """
    Mixin to handle common permission logic:
    - list: AllowAny
    - others: IsAdminUser + IsAuthenticated
    """

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser, IsAuthenticated]

        return [permission() for permission in permission_classes]
    

  
class AdminOnlyMixin:
    """
    Restricts access to admin users only.
    Any ViewSet inheriting this becomes admin-protected.
    """
    permission_classes = [IsAdminUser, IsAuthenticated]