import uuid

from django.db import models

from pillowfort.validators import validate_name


class Blueprint(models.Model):
    class TYPES(models.TextChoices):
        MAP = ('map', 'Map')
        CHARACTER = ('character', 'Character')
        ENTITY = ('entity', 'Entity')

    type = models.CharField(
        max_length=10,
        choices=TYPES.choices,
    )

    name = models.CharField(
        max_length=256,
        verbose_name='Name',
        validators=[validate_name],
    )

    space = models.ForeignKey(
        'pillowfort.Space',
        verbose_name='Space',
        on_delete=models.CASCADE,
        related_name='blueprints',
    )

    data = models.JSONField(
        verbose_name='Data',
        default=dict,
        null=True,
        blank=True,
    )

    optimized_data = models.JSONField(
        verbose_name='Optimized Data',
        default=dict,
        null=True,
        blank=True,
    )

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
        verbose_name = 'Blueprint'
        verbose_name_plural = 'Blueprints'
