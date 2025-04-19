from django.contrib import admin

from .account import AccountAdmin  # NOQA
from .asset import AssetAdmin  # NOQA

admin.site.site_header = 'pillowfort Admin'
admin.site.site_title = 'pillowfort Admin'
