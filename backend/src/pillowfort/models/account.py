from django.contrib.auth.models import User
from django.db import models


class AccountQuerySet(models.QuerySet):
    def get_or_create_by_username(self, username):
        user, _ = User.objects.get_or_create(username=username)

        return Account.objects.get_or_create(user=user)


class Account(models.Model):
    objects = AccountQuerySet.as_manager()

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )

    home_space = models.ForeignKey(
        "pillowfort.Space",
        verbose_name="Home Space",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    character_data = models.JSONField(
        verbose_name="Character Data",
        default=dict,
        null=True,
        blank=True,
    )

    # common fields
    added = models.DateTimeField(
        verbose_name="Added",
        auto_now_add=True,
        editable=False,
    )

    modified = models.DateTimeField(
        verbose_name="Modified",
        auto_now=True,
        editable=False,
    )

    config = models.JSONField(
        verbose_name="Config",
        default=dict,
        null=True,
        blank=True,
    )

    comment = models.TextField(
        verbose_name="Comment",
        default="",
        null=True,
        blank=True,
    )

    def __str__(self):
        return str(self.user)

    class Meta:
        verbose_name = "Account"
        verbose_name_plural = "Accounts"
