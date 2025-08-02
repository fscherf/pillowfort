from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, reverse


@login_required
def index(request):
    if not request.account or not request.account.home_space:
        return redirect(reverse('login'))

    return redirect(
        request.account.home_space.get_absolute_url(),
    )

