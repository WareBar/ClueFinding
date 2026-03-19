from django.db import models
from core.querysets import BaseQuerySet


# Create your models here.
class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = BaseQuerySet.as_manager()


    class Meta:
        abstract = True
        ordering = ["-updated_at"]