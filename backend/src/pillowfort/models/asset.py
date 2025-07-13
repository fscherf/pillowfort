import uuid
import os

from django.conf import settings
from django.db import models

from pillowfort.validators import validate_name, validate_png


def upload_to(instance, filename):
    ATTEMPTS = 10

    for _ in range(ATTEMPTS):
        rel_dir_path = f'assets/{uuid.uuid4().hex}'
        abs_dir_path = os.path.join(settings.MEDIA_ROOT, rel_dir_path)

        if not os.path.isdir(abs_dir_path):
            return f'{rel_dir_path}/{filename}'

    raise RuntimeError(
        f'failed to generate a unique upload path after {ATTEMPTS} attempts',
    )


class AssetQuerySet(models.QuerySet):
    def delete(self, *args, **kwargs):
        for asset in self:
            asset.delete(*args, **kwargs)


class Asset(models.Model):
    objects = AssetQuerySet.as_manager()

    name = models.CharField(
        max_length=256,
        verbose_name='Name',
        validators=[validate_name],
    )

    file = models.FileField(
        upload_to=upload_to,
        validators=[validate_png],
    )

    space = models.ForeignKey(
        'pillowfort.space',
        related_name='assets',
        on_delete=models.CASCADE,
        verbose_name='Space',
    )

    generated = models.BooleanField(
        verbose_name='Generated',
        default=False,
    )

    # common fields
    added = models.DateTimeField(
        verbose_name='Added',
        auto_now_add=True,
        editable=False,
    )

    modified = models.DateTimeField(
        verbose_name='Modified',
        auto_now=True,
        editable=False,
    )

    config = models.JSONField(
        verbose_name='Config',
        default=dict,
        null=True,
        blank=True,
    )

    comment = models.TextField(
        verbose_name='Comment',
        default='',
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.space}:{self.name}"

    def delete(self, *args, **kwargs):
        if self.file and os.path.isfile(self.file.path):
            os.remove(self.file.path)

        return super().delete(*args, **kwargs)

    class Meta:
        verbose_name = 'Asset'
        verbose_name_plural = 'Assets'
