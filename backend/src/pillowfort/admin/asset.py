from django.contrib import admin

from pillowfort.models import Asset


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    pass
