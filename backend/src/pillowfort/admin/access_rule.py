from django.utils.html import format_html
from django.contrib import admin
from django.urls import reverse

from pillowfort.models import AccessRule


@admin.register(AccessRule)
class AccessRuleAdmin(admin.ModelAdmin):
    list_display = (
        '__str__',
        'account_link',
        'space_link',
        'is_admin',
        'can_edit',
        'can_grant_access',
        'added',
        'modified',
    )

    list_filter = (
        'account',
        'space',
        'is_admin',
        'can_edit',
        'can_grant_access',
        'added',
        'modified',
    )

    search_fields = (
        'space__url',
        'space__verbose_name',
        'account__name',
        'account__user__email',
    )

    fieldsets = (
        ('Config', {
            'fields': (
                'space',
                'account',
                'config',
            ),
        }),
        ('Permissions', {
            'fields': (
                'is_admin',
                'can_edit',
                'can_grant_access',
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
    def space_link(self, obj):
        admin_url = reverse(
            'admin:pillowfort_space_change',
            args=[obj.space.pk],
        )

        return format_html(
            f'<a href="{admin_url}">{obj.space.url}</a>',
        )

    def account_link(self, obj):
        admin_url = reverse(
            'admin:pillowfort_account_change',
            args=[obj.space.pk],
        )

        return format_html(
            f'<a href="{admin_url}">{obj.account.user.username}</a>',
        )

    space_link.short_description = 'Space'
    account_link.short_description = 'Account'
