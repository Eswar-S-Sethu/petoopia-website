from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Custom admin that saves/queries the products_db database.
    """
    using = 'products_db'

    list_display = [
        'id', 'name', 'category', 'price', 'original_price',
        'rating', 'reviews', 'badge', 'in_stock',
        'is_best_seller', 'is_new_arrival', 'updated_at',
    ]
    list_filter = ['category', 'in_stock', 'is_best_seller', 'is_new_arrival', 'badge']
    search_fields = ['name', 'category', 'description']
    list_editable = ['price', 'in_stock', 'is_best_seller', 'is_new_arrival']
    ordering = ['id']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'category', 'emoji', 'badge')
        }),
        ('Pricing', {
            'fields': ('price', 'original_price')
        }),
        ('Ratings', {
            'fields': ('rating', 'reviews')
        }),
        ('Status', {
            'fields': ('in_stock', 'is_best_seller', 'is_new_arrival')
        }),
        ('Content', {
            'fields': ('description', 'highlights', 'specs'),
            'classes': ('wide',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    # ── Route to products_db ──────────────────────────────────────────────────

    def get_queryset(self, request):
        return super().get_queryset(request).using(self.using)

    def save_model(self, request, obj, form, change):
        obj.save(using=self.using)

    def delete_model(self, request, obj):
        obj.delete(using=self.using)

    def delete_queryset(self, request, queryset):
        queryset.using(self.using).delete()
