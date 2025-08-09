from django.urls import include, path, re_path
from django.contrib import admin

from pillowfort.views import json_rpc, game, gui, frontend

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('json-rpc/client/', json_rpc.client),
    path('gui', gui.index),
    re_path(r'^s(?:/(?P<url>.*))?$', frontend.index, name='frontend__index'),
    path('', game.index),
]
