import uuid
from django.db import migrations

DEFAULT_CATEGORIES = [
    {'id': 'b1ea5a00-0001-0000-0000-000000000001', 'name': 'Breakfast', 'icon': 'sunny-outline'},
    {'id': 'b1ea5a00-0001-0000-0000-000000000002', 'name': 'Lunch', 'icon': 'restaurant-outline'},
    {'id': 'b1ea5a00-0001-0000-0000-000000000003', 'name': 'Dinner', 'icon': 'moon-outline'},
    {'id': 'b1ea5a00-0001-0000-0000-000000000004', 'name': 'Snack', 'icon': 'cafe-outline'},
    {'id': 'b1ea5a00-0001-0000-0000-000000000005', 'name': 'Dessert', 'icon': 'ice-cream-outline'},
    {'id': 'b1ea5a00-0001-0000-0000-000000000006', 'name': 'Drink', 'icon': 'wine-outline'},
]


def seed_categories(apps, schema_editor):
    Category = apps.get_model('recipes', 'Category')
    for cat in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(id=cat['id'], defaults={'name': cat['name'], 'icon': cat['icon'], 'user': None})


def remove_categories(apps, schema_editor):
    Category = apps.get_model('recipes', 'Category')
    ids = [cat['id'] for cat in DEFAULT_CATEGORIES]
    Category.objects.filter(id__in=ids).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_categories, remove_categories),
    ]
