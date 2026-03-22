from django.db.models import Q
from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Category, Recipe
from .serializers import CategorySerializer, RecipeSerializer


class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            Q(user=None) | Q(user=self.request.user)
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RecipeViewSet(viewsets.ModelViewSet):
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Recipe.objects.filter(user=self.request.user)
            .prefetch_related('ingredients', 'steps', 'categories')
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
