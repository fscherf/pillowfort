from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from pillowfort.models import Account, Space, AccessRule


class Command(BaseCommand):
    def handle(self, *args, **options):
        root_space = Space.objects.create(
            name="",
            verbose_name="root",
        )

        user = User.objects.filter(is_superuser=True).first()

        account = Account.objects.create(
            user=user,
            home_space=root_space,
        )

        AccessRule.objects.create(
            account=account,
            space=root_space,
            is_admin=True,
        )
