from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    discount_pct = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'price', 'original_price',
            'rating', 'reviews', 'badge', 'emoji', 'in_stock',
            'is_best_seller', 'is_new_arrival', 'description',
            'highlights', 'specs', 'discount_pct', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'discount_pct']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing (no description/specs)."""
    discount_pct = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'price', 'original_price',
            'rating', 'reviews', 'badge', 'emoji', 'in_stock',
            'is_best_seller', 'is_new_arrival', 'discount_pct',
        ]
