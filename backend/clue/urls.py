from rest_framework.routers import DefaultRouter
from clue.views import ClueViewset
from django.urls import path, include

router = DefaultRouter()
router.register("clue",ClueViewset,basename="clues")

urlpatterns = [
    path("",include(router.urls))
]

