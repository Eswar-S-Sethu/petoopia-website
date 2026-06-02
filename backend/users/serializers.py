from rest_framework import serializers
from .models import UserProfile, Pet, CartItem, WishlistItem


class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = ['id', 'name', 'pet_type', 'breed', 'age', 'emoji', 'created_at']
        read_only_fields = ['id', 'emoji', 'created_at']


class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = [
            'id', 'product_id', 'product_name', 'product_price',
            'product_emoji', 'product_category', 'quantity', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class WishlistItemSerializer(serializers.ModelSerializer):
    discount_pct = serializers.SerializerMethodField()

    class Meta:
        model = WishlistItem
        fields = [
            'id', 'product_id', 'product_name', 'product_price',
            'product_original_price', 'product_emoji', 'product_category',
            'in_stock', 'discount_pct', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_discount_pct(self, obj):
        if obj.product_original_price and obj.product_original_price > obj.product_price:
            return round((1 - obj.product_price / obj.product_original_price) * 100)
        return 0
