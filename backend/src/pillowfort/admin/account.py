from django.utils.html import format_html
from django.contrib import admin
from django.urls import reverse

from pillowfort.models import Account


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = (
        '__str__',
        'user_link',
        'home_space_link',
        'added',
        'modified',
    )

    list_filter = (
        'added',
        'modified',
    )

    search_fields = (
        'account__user__name',
        'account__user__email',
    )

    fieldsets = (
        ('Config', {
            'fields': (
                'user',
                'home_space',
            ),
        }),
        ('Character Data', {
            'fields': (
                'character_data',
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
        'uuid',
        'added',
        'modified',
    )

    # list display
    def user_link(self, obj):
        admin_url = reverse(
            'admin:auth_user_change',
            args=[obj.user.pk],
        )

        return format_html(
            f'<a href="{admin_url}">{obj.user.username}</a>',
        )

    def home_space_link(self, obj):
        admin_url = reverse(
            'admin:pillowfort_space_change',
            args=[obj.home_space.pk],
        )

        return format_html(
            f'<a href="{admin_url}">{obj.home_space.url}</a>',
        )

    user_link.short_description = 'User'
    home_space_link.short_description = 'Home Space'
