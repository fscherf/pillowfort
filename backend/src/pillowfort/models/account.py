from django.contrib.auth.models import User
from django.db import models


class Account(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )
