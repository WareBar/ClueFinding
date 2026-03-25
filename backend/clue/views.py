from django.shortcuts import render
from clue.models import Clue
from clue.serializers import ClueSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status


class ClueViewset(ModelViewSet):
    queryset = Clue.objects.all()
    serializer_class = ClueSerializer
    def _validate_and_normalize(self, request):
        clues = request.data.get("clues", [])

        if not isinstance(clues, list):
            return None, Response(
                {"error": "Clues must be a list"},
                status=status.HTTP_400_BAD_REQUEST
            )

        normalized = [c.strip().lower() for c in clues]
        return normalized, None
    def _get_clue_map(self, value="object"):
        """
        value = "object" → returns full Clue instance
        value = "index" → returns only index
        """
        db_clues = Clue.objects.all()

        if value == "index":
            return {c.clue.lower(): c.index for c in db_clues}

        return {c.clue.lower(): c for c in db_clues}

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def check_clue(self, request):
        input_clues, error = self._validate_and_normalize(request)
        if error:
            return error

        db_clue_map = self._get_clue_map()

        correct = []
        wrong = []

        for clue in input_clues:
            if clue in db_clue_map:
                correct.append(clue)
            else:
                wrong.append(clue)

        return Response({
            "correct_clues": correct,
            "wrong_clues": wrong
        })


    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def check_order(self, request):
        input_clues, error = self._validate_and_normalize(request)
        if error:
            return error

        db_clue_map = self._get_clue_map(value="index")

        indexes = []
        invalid_clues = []

        for clue in input_clues:
            if clue in db_clue_map:
                indexes.append(db_clue_map[clue])
            else:
                invalid_clues.append(clue)

        if invalid_clues:
            return Response({
                "error": "Some clues are invalid",
                "invalid_clues": invalid_clues
            }, status=status.HTTP_400_BAD_REQUEST)

        is_correct_order = indexes == sorted(indexes)

        return Response({
            "is_correct_order": is_correct_order,
        })