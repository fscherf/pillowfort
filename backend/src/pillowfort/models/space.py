from types import SimpleNamespace
import uuid
import os

from django.db.models.signals import pre_save, post_save
from django.core.exceptions import ValidationError
from django.db import transaction, models
from django.shortcuts import reverse
from django.dispatch import receiver

from pillowfort.validators import validate_name
from pillowfort.models import AccessRule


class SpaceQuerySet(models.QuerySet):
    def get_by_url(self, url):
        """
        supported formats:

         - /s/foo/bar/baz/
         - /s/foo/bar/baz
         - foo/bar/baz
        """

        if url != "/" and url.endswith("/"):
            url = url[:-1]

        if url.startswith("/s/"):
            url = url[2:]

        try:
            return Space.objects.get(url=url)

        except Space.DoesNotExist:
            return None

    def get_or_create_by_url(self, url):
        if url != "/":
            if url.startswith("/"):
                url = url[1:]

            if url.endswith("/"):
                url = url[:-1]

            if url.startswith("s/"):
                url = url[2:]

        names = [
            i.strip() for i in url.split("/") if i.strip()
        ]

        space, created = Space.objects.get_or_create(
            name="",
            parent=None,
        )

        for name in names:
            space, created = Space.objects.get_or_create(
                name=name,
                parent=space,
            )

        return space, created


class Space(models.Model):
    objects = SpaceQuerySet.as_manager()

    parent = models.ForeignKey(
        "pillowfort.Space",
        related_name="children",
        verbose_name="Parent Space",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    name = models.CharField(
        max_length=256,
        verbose_name="Name",
        validators=[validate_name],
        null=True,
        blank=True,
    )

    verbose_name = models.CharField(
        max_length=256,
        verbose_name="Verbose Name",
        null=True,
        blank=True,
    )

    url = models.TextField(
        verbose_name="URL",
        null=True,
        blank=True,
        editable=False,
    )

    is_public = models.BooleanField(
        verbose_name="is public",
        default=False,
    )

    map_data = models.JSONField(
        verbose_name="Map Data",
        default=dict,
        null=True,
        blank=True,
    )

    optimized_map_data = models.JSONField(
        verbose_name="Optimized Map Data",
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

    @property
    def children_all(self):
        def iter_children(space):
            for child in space.children.all():
                yield child
                yield from iter_children(child)

        return iter_children(self)

    @property
    def assets_all(self):
        current = self

        while current:
            yield from current.assets.all()

            current = current.parent

    @property
    def tilesets_all(self):
        current = self

        while current:
            yield from current.tilesets.all()

            current = current.parent

    @property
    def blueprints_all(self):
        current = self

        while current:
            yield from current.blueprints.all()

            current = current.parent

    def __str__(self):
        return self.url

    def clean(self):
        if self.parent and not self.name:
            raise ValidationError("Subspaces must have a name")

        if not self.parent and self.name:
            raise ValidationError("named spaces must have a parent")

        conflicting_space = Space.objects.filter(
            ~models.Q(pk=self.pk),
            parent=self.parent,
            name=self.name,
        )

        if conflicting_space.exists():
            raise ValidationError(
                "parent and name combination has to be unique",
            )

    def save(self, *args, **kwargs):
        self.clean()

        segments = []
        current = self

        while current:
            segments.insert(0, current.name)

            current = current.parent

        self.url = os.path.join(*["/", *segments])

        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse(
            'frontend__index',
            args=(self.url[1:],)
        )

    def get_access(self, account):
        access = SimpleNamespace(
            **{
                permission: False
                for permission in AccessRule.PERMISSIONS + ["has_access"]
            }
        )

        current = self

        while current:
            access_rule = current.access_rules.filter(
                account=account,
            ).first()

            if current.is_public:
                access.has_access = True

            current = current.parent

            if not access_rule:
                continue

            for permission in AccessRule.PERMISSIONS:
                if getattr(access_rule, permission):
                    setattr(access, permission, True)

                    access.has_access = True

        return access

    class Meta:
        verbose_name = "Space"
        verbose_name_plural = "Spaces"


@receiver(pre_save, sender=Space)
def store_old_name(sender, instance, **kwargs):
    instance._old_name = None

    if not instance.pk:
        return

    try:
        old_instance = Space.objects.get(pk=instance.pk)
        instance._old_name = old_instance.name

    except Space.DoesNotExist:
        pass


@receiver(post_save, sender=Space)
def update_children_urls(sender, instance, created, **kwargs):
    if created:
        return

    if instance._old_name is None or instance._old_name == instance.name:
        return

    with transaction.atomic():
        for child in instance.children_all:
            child.save()
