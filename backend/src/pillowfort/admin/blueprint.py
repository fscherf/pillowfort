from django.utils.html import format_html
from django.contrib import admin
from django.urls import reverse
from django import forms

from pillowfort.forms import PrettyJSONWidget
from pillowfort.models import Blueprint


class BlueprintModelForm(forms.ModelForm):
    config = forms.JSONField(
        widget=PrettyJSONWidget,
        required=False,
    )

    data = forms.JSONField(
        widget=PrettyJSONWidget,
        required=False,
    )

    optimized_data = forms.JSONField(
        widget=PrettyJSONWidget,
        required=False,
    )

    class Meta:
        model = Blueprint
        fields = '__all__'


@admin.register(Blueprint)
class BlueprintAdmin(admin.ModelAdmin):
    form = BlueprintModelForm

    list_display = (
        'name',
        'space_link',
        'type',
        'added',
        'modified',
    )

    list_filter = (
        'space',
        'type',
        'added',
        'modified',
    )

    search_fields = (
        'name',
    )

    fieldsets = (
        ('Config', {
            'fields': (
                'space',
                'type',
                'name',
                'config',
            ),
        }),
        ('Data', {
            'fields': (
                'data',
                'optimized_data',
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
