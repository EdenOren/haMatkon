from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryListCreateView, RecipeViewSet

router = DefaultRouter()
router.register('', RecipeViewSet, basename='recipe')

urlpatterns = [
    path('categories/', CategoryListCreateView.as_view()),
    path('', include(router.urls)),
]
