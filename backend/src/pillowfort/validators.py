import re

from django.core.exceptions import ValidationError

from PIL import Image

NAME_RE = re.compile(r'^[a-z0-9_-]+$')


def validate_name(value):
    if not value:
        return

    if not NAME_RE.match(value):
        raise ValidationError(
            'Names can only contain lower case letters, numbers, dashes (-), '
            'and underscores (_).',
        )


def validate_png(file):
    try:
        image = Image.open(file)

    except Exception as exception:
        raise ValidationError('invalid image') from exception

    if image.format != 'PNG':
        raise ValidationError('image is no PNG')

    file.seek(0)
