from django.db import models
from core.models import BaseModel

# Create your models here.


class Clue(BaseModel):
    clue = models.CharField(
        max_length=120,
        null=False,
        blank=False,
        unique=True
    )
    index = models.IntegerField(
        null=False,
        blank=False,
        unique=True
    )

    def __str__(self):
        return self.clue
    

