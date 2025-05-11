from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def client(request):
    return render(request, "json-rpc/client.html", {})
