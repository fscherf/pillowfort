import math
import io

from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator
from django.http import HttpResponse, Http404
from django.utils.html import format_html
from django.contrib import admin
from django.urls import reverse
from django.urls import path

from PIL import Image, ImageDraw, ImageFont

from pillowfort.models import Tileset


@admin.register(Tileset)
class TilesetAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'space_link',
        'asset_link',
        'grid',
        'added',
        'modified',
    )

    list_filter = (
        'space',
        'asset',
        'added',
        'modified',
    )

    search_fields = (
        'name',
        'space__url',
        'asset__name',
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
                'asset',
                'name',
                'width',
                'height',
                'config',
            ),
        }),
        ('Meta Data', {
            'fields': (
                'uuid',
                'added',
                'modified',
                'comment',
            ),
        }),
    )

    readonly_fields = (
        'preview',
        'uuid',
        'added',
        'modified',
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

    def asset_link(self, obj):
        admin_url = reverse(
            'admin:pillowfort_asset_change',
            args=[obj.asset.pk],
        )

        return format_html(
            f'<a href="{admin_url}">{obj.asset.name}</a>',
        )

    def grid(self, obj):
        return f'{obj.width}x{obj.height}'

    space_link.short_description = 'Space'
    asset_link.short_description = 'Asset'
    grid.short_description = 'Grid'

    # fieldsets
    def preview(self, obj):
        if not obj.__class__.objects.filter(uuid=obj.uuid).exists():
            return "Not available"

        return format_html("""
            <div style="width: 1000px; height: auto; overflow: auto; border: 1px solid #ccc;">
                <img src="../preview" />
            </div>
        """)

    preview.short_description = "Preview"

    # views
    def get_urls(self):
        return [
            path(
                '<uuid:pk>/preview/',
                self.admin_site.admin_view(self.preview_view),
                name='admin__tileset__preview'
            ),
            *super().get_urls()
        ]

    @method_decorator(staff_member_required)
    @method_decorator(never_cache)
    def preview_view(self, request, pk, *args, **kwargs):
        try:
            tileset = Tileset.objects.get(pk=pk)

            with tileset.asset.file.open('rb') as f:
                image = Image.open(f).convert('RGBA')

            draw = ImageDraw.Draw(image)

            width, height = image.size

            # draw grid
            for x in range(0, width, tileset.width):
                draw.line([(x, 0), (x, height)], fill='red', width=1)

            for y in range(0, height, tileset.height):
                draw.line([(0, y), (width, y)], fill='red', width=1)

            # draw tile ids
            font = ImageFont.load_default()
            cols = math.ceil(width / tileset.width)
            rows = math.ceil(height / tileset.height)
            tile_id = 0

            for row in range(rows):
                for col in range(cols):
                    x = col * tileset.width
                    y = row * tileset.height

                    draw.text(
                        (x + 4, y + 2),
                        str(tile_id),
                        font=font,
                        fill=(255, 0, 0),
                    )

                    tile_id += 1

            # render to response
            buffer = io.BytesIO()

            image.save(buffer, format='PNG')
            buffer.seek(0)

            return HttpResponse(buffer, content_type='image/png')

        except Tileset.DoesNotExist:
            raise Http404('Tileset not found')
