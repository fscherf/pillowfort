import uuid
import os

from django.core.exceptions import ValidationError
from django.conf import settings
from django.db import models

from PIL import Image


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


def validate_png(file):
    try:
        image = Image.open(file)

    except Exception as exception:
        raise ValidationError('invalid image') from exception

    if image.format != 'PNG':
        raise ValidationError('image is no PNG')

    file.seek(0)


class AssetQuerySet(models.QuerySet):
    def delete(self, *args, **kwargs):
        for asset in self:
            asset.delete(*args, **kwargs)


class Asset(models.Model):
    objects = AssetQuerySet.as_manager()

    file = models.FileField(
        upload_to=upload_to,
        validators=[validate_png],
    )

    def __str__(self):
        return self.file.name

    def delete(self, *args, **kwargs):
        if self.file and os.path.isfile(self.file.path):
            os.remove(self.file.path)

        return super().delete(*args, **kwargs)
