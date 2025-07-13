from django.contrib import admin

from pillowfort.models import Space


@admin.register(Space)
class SpaceAdmin(admin.ModelAdmin):
    list_display = (
        'url',
        'is_public',
        'added',
        'modified',
    )

    list_filter = (
        'added',
        'modified',
    )

    search_fields = (
        'name',
        'verbose_name',
        'url',
    )

    fieldsets = (
        ('Config', {
            'fields': (
                'name',
                'verbose_name',
                'is_public',
                'config',
            ),
        }),
        ('Map Data', {
            'fields': (
                'map_data',
                'optimized_map_data',
            ),
        }),
        ('Meta Data', {
            'fields': (
                'added',
                'modified',
                'url',
                'comment',
            ),
        }),
    )

    readonly_fields = (
        'added',
        'modified',
        'url',
    )
