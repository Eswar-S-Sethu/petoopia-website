from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, Pet, CartItem, WishlistItem


# ── Inline for UserProfile ────────────────────────────────────────────────────

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = ['phone']


class PetInline(admin.TabularInline):
    model = Pet
    extra = 0
    fields = ['name', 'pet_type', 'breed', 'age', 'emoji']
    readonly_fields = ['emoji']


# ── Extend the built-in UserAdmin ─────────────────────────────────────────────

class UserAdmin(BaseUserAdmin):
    inlines = [UserProfileInline, PetInline]
    list_display = ['id', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined']
    list_filter = ['is_staff', 'is_active', 'date_joined']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-date_joined']


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


# ── Cart & Wishlist in admin ──────────────────────────────────────────────────

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product_name', 'product_category', 'product_price', 'quantity', 'created_at']
    list_filter = ['product_category']
    search_fields = ['user__email', 'product_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at']


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product_name', 'product_category', 'product_price', 'in_stock', 'created_at']
    list_filter = ['product_category', 'in_stock']
    search_fields = ['user__email', 'product_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at']


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'name', 'pet_type', 'breed', 'age']
    list_filter = ['pet_type']
    search_fields = ['user__email', 'name', 'breed']
