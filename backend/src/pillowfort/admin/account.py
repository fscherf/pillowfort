from django.contrib import admin

from pillowfort.models import Account


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    pass
