from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=300)
    category = models.CharField(max_length=50)          # Dogs | Cats | Birds
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.FloatField(default=0)
    reviews = models.IntegerField(default=0)
    badge = models.CharField(max_length=50, blank=True, null=True)
    emoji = models.CharField(max_length=10, blank=True, default='')
    in_stock = models.BooleanField(default=True)
    is_best_seller = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    highlights = models.JSONField(default=list)
    specs = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'products'
        ordering = ['id']

    def __str__(self):
        return self.name

    @property
    def discount_pct(self):
        if self.original_price and self.original_price > self.price:
            return round((1 - self.price / self.original_price) * 100)
        return 0
