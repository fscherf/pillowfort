import uuid

from django.db import models

from pillowfort.validators import validate_name


class Tileset(models.Model):
    name = models.CharField(
        max_length=256,
        verbose_name='Name',
        validators=[validate_name],
    )

    space = models.ForeignKey(
        'pillowfort.Space',
        verbose_name='Space',
        on_delete=models.CASCADE,
        related_name='tilesets',
    )

    asset = models.ForeignKey(
        'pillowfort.Asset',
        verbose_name='Asset',
        on_delete=models.CASCADE,
        related_name='tilesets',
    )

    width = models.PositiveSmallIntegerField()
    height = models.PositiveSmallIntegerField()

    # common fields
    uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

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
        return self.name

    class Meta:
        verbose_name = 'Tileset'
        verbose_name_plural = 'Tilesets'
