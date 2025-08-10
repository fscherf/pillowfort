from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator
from django.http import HttpResponse, Http404
from django.utils.html import format_html
from django.contrib import admin
from django.urls import reverse
from django.urls import path

from pillowfort.models import Asset


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'space_link',
        'generated',
        'added',
        'modified',
    )

    list_filter = (
        'space',
        'generated',
        'added',
        'modified',
    )

    search_fields = (
        'name',
        'space__url',
    )

    fieldsets = (
        (None, {
            'fields': (
                'preview',
            ),
        }),
        ('Config', {
            'fields': (
                'space',
                'name',
                'file',
                'config',
            ),
        }),
        ('Meta Data', {
            'fields': (
                'uuid',
                'added',
                'modified',
                'generated',
                'comment',
            ),
        }),
    )

    readonly_fields = (
        'preview',
        'uuid',
        'added',
        'modified',
        'generated',
    )

    # list display
    def space_link(self, obj):
        admin_url = reverse(
            'admin:pillowfort_space_change',
            args=[obj.space.pk],
        )

        return format_html(
            f'<a href="{admin_url}">{obj.space.url}</a>',
        )

    space_link.short_description = 'Space'

    # viewsets
    def preview(self, obj):
        if not obj.__class__.objects.filter(uuid=obj.uuid).exists():
            return "Not available"

        return format_html(
            '<img src="../preview" style="max-width: 100%; height: auto; border: 1px solid #ccc;" />',
        )

    preview.short_description = "Preview"

    # views
    def get_urls(self):
        return [
            path(
                '<uuid:pk>/preview/',
                self.admin_site.admin_view(self.preview_view),
                name='admin__asset__preview'
            ),
            *super().get_urls()
        ]

    @method_decorator(staff_member_required)
    @method_decorator(never_cache)
    def preview_view(self, request, pk, *args, **kwargs):
        try:
            asset = Asset.objects.get(pk=pk)

            with asset.file.open('rb') as f:
                data = f.read()

            return HttpResponse(data, content_type='image/png')

        except Asset.DoesNotExist:
            raise Http404('Asset not found')
