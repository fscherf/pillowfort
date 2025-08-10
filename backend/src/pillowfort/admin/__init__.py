from django.contrib import admin

from .access_rule import AccessRuleAdmin  # NOQA
from .blueprint import BlueprintAdmin  # NOQA
from .account import AccountAdmin  # NOQA
from .tileset import TilesetAdmin  # NOQA
from .asset import AssetAdmin  # NOQA
from .space import SpaceAdmin  # NOQA

admin.site.site_header = 'pillowfort Admin'
admin.site.site_title = 'pillowfort Admin'
