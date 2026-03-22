from rest_framework import serializers
from .models import Category, Recipe, Ingredient, Step


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'icon')
        read_only_fields = ('id',)


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ('id', 'name', 'amount', 'unit', 'order')
        read_only_fields = ('id',)


class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = ('id', 'order', 'text')
        read_only_fields = ('id',)


class RecipeSerializer(serializers.ModelSerializer):
    ingredients = IngredientSerializer(many=True, default=list)
    steps = StepSerializer(many=True, default=list)
    category_ids = serializers.PrimaryKeyRelatedField(
        source='categories',
        many=True,
        queryset=Category.objects.all(),
        default=list,
    )

    class Meta:
        model = Recipe
        fields = (
            'id', 'title', 'description', 'image_url', 'source_url',
            'servings', 'prep_time_minutes', 'cook_time_minutes',
            'category_ids', 'ingredients', 'steps', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients', [])
        steps_data = validated_data.pop('steps', [])
        categories = validated_data.pop('categories', [])

        recipe = Recipe.objects.create(**validated_data)
        recipe.categories.set(categories)

        for ing in ingredients_data:
            Ingredient.objects.create(recipe=recipe, **ing)
        for step in steps_data:
            Step.objects.create(recipe=recipe, **step)

        return recipe

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop('ingredients', None)
        steps_data = validated_data.pop('steps', None)
        categories = validated_data.pop('categories', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if categories is not None:
            instance.categories.set(categories)

        if ingredients_data is not None:
            instance.ingredients.all().delete()
            for ing in ingredients_data:
                Ingredient.objects.create(recipe=instance, **ing)

        if steps_data is not None:
            instance.steps.all().delete()
            for step in steps_data:
                Step.objects.create(recipe=instance, **step)

        return instance
