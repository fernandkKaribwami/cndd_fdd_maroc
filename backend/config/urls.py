from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

admin.site.site_header = "CNDD-FDD Maroc — Administration"
admin.site.site_title = "CNDD-FDD Maroc"
admin.site.index_title = "Panneau d'administration"

urlpatterns = [
    path("admin/", admin.site.urls),
    # Auth JWT
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # Apps
    path("api/", include("core.urls")),
    path("api/", include("members.urls")),
    path("api/", include("contributions.urls")),
    path("api/", include("dashboard_api.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
