from rest_framework.serializers import ModelSerializer
from clue.models import Clue


class ClueSerializer(ModelSerializer):
    class Meta:
        model = Clue
        fields = "__all__"
