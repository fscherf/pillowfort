from django.urls import include, path
from django.contrib import admin

from pillowfort.views.index import index

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('', index),
]
