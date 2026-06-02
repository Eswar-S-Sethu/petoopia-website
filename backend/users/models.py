from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Extended profile for each registered user."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)

    class Meta:
        app_label = 'users'

    def __str__(self):
        return f'{self.user.get_full_name()} — profile'


class Pet(models.Model):
    """A pet registered to a user account."""
    PET_TYPES = [('Dogs', 'Dogs'), ('Cats', 'Cats'), ('Birds', 'Birds')]
    PET_EMOJIS = {'Dogs': '🐕', 'Cats': '🐈', 'Birds': '🦜'}

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pets')
    name = models.CharField(max_length=100)
    pet_type = models.CharField(max_length=50, choices=PET_TYPES)
    breed = models.CharField(max_length=100)
    age = models.CharField(max_length=50)
    emoji = models.CharField(max_length=10, default='🐾')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'users'

    def save(self, *args, **kwargs):
        self.emoji = self.PET_EMOJIS.get(self.pet_type, '🐾')
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} ({self.user.get_full_name()})'


class CartItem(models.Model):
    """
    A product in a user's cart.
    Product details are denormalised here because products live in a
    separate database (products_db) and cross-DB FKs are not allowed.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    product_id = models.IntegerField()
    product_name = models.CharField(max_length=300)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    product_emoji = models.CharField(max_length=10)
    product_category = models.CharField(max_length=50)
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'users'
        unique_together = ['user', 'product_id']

    def __str__(self):
        return f'{self.product_name} × {self.quantity} ({self.user.email})'


class WishlistItem(models.Model):
    """
    A product saved to a user's wishlist.
    Same denormalisation approach as CartItem.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    product_id = models.IntegerField()
    product_name = models.CharField(max_length=300)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    product_original_price = models.DecimalField(max_digits=10, decimal_places=2)
    product_emoji = models.CharField(max_length=10)
    product_category = models.CharField(max_length=50)
    in_stock = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'users'
        unique_together = ['user', 'product_id']

    def __str__(self):
        return f'{self.product_name} ♥ ({self.user.email})'
