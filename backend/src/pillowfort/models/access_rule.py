from django.db import models


class AccessRule(models.Model):
    PERMISSIONS = [
        "is_admin",
        "can_edit",
        "can_grant_access",
    ]

    space = models.ForeignKey(
        "pillowfort.space",
        related_name="access_rules",
        verbose_name="Space",
        on_delete=models.CASCADE,
    )

    account = models.ForeignKey(
        "pillowfort.Account",
        verbose_name="Account",
        on_delete=models.CASCADE,
    )

    is_admin = models.BooleanField(
        verbose_name="is admin",
        default=False,
    )

    can_edit = models.BooleanField(
        verbose_name="can edit",
        default=False,
    )

    can_grant_access = models.BooleanField(
        verbose_name="can grant access",
        default=False,
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
        return f"{self.account}@{self.space}"

    class Meta:
        verbose_name = "Access Rule"
        verbose_name_plural = "Access Rules"
