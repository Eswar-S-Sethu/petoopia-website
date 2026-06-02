from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile, Pet, CartItem, WishlistItem
from .serializers import PetSerializer, CartItemSerializer, WishlistItemSerializer


# ── Helpers ───────────────────────────────────────────────────────────────────

def user_payload(user):
    profile = getattr(user, 'profile', None)
    return {
        'id': user.id,
        'name': user.get_full_name(),
        'email': user.email,
        'is_staff': user.is_staff,
        'phone': profile.phone if profile else '',
        'member_since': profile.user.date_joined.strftime('%B %Y') if profile else '',
    }


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        phone = data.get('mobile', '').strip()

        if not name or not email or not password:
            return Response({'detail': 'Name, email, and password are required.'}, status=400)

        if User.objects.filter(username=email).exists():
            return Response({'email': 'An account with this email already exists.'}, status=400)

        parts = name.split(' ', 1)
        user = User.objects.create_user(
            username=email,
            email=email,
            first_name=parts[0],
            last_name=parts[1] if len(parts) > 1 else '',
            password=password,
        )
        UserProfile.objects.create(user=user, phone=phone)

        return Response({'detail': 'Account created successfully.'}, status=201)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        user = authenticate(request, username=email, password=password)
        if not user:
            return Response({'detail': 'Incorrect email or password.'}, status=400)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_payload(user),
        })


class TokenRefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'detail': 'Refresh token required.'}, status=400)
        try:
            refresh = RefreshToken(refresh_token)
            return Response({'access': str(refresh.access_token)})
        except Exception:
            return Response({'detail': 'Invalid or expired refresh token.'}, status=401)


# ── Profile ───────────────────────────────────────────────────────────────────

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(user_payload(request.user))

    def put(self, request):
        user = request.user
        data = request.data

        if 'name' in data:
            parts = data['name'].strip().split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''
            user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if 'phone' in data:
            profile.phone = data['phone']
            profile.save()

        return Response(user_payload(user))


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        current = request.data.get('current_password', '')
        new_pw = request.data.get('new_password', '')

        if not user.check_password(current):
            return Response({'detail': 'Incorrect current password.'}, status=400)
        if len(new_pw) < 8:
            return Response({'detail': 'New password must be at least 8 characters.'}, status=400)

        user.set_password(new_pw)
        user.save()
        return Response({'detail': 'Password updated successfully.'})


# ── Pets ──────────────────────────────────────────────────────────────────────

class PetsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pets = Pet.objects.filter(user=request.user).order_by('created_at')
        return Response(PetSerializer(pets, many=True).data)

    def post(self, request):
        pet = Pet(
            user=request.user,
            name=request.data.get('name', ''),
            pet_type=request.data.get('type', 'Dogs'),
            breed=request.data.get('breed', ''),
            age=request.data.get('age', ''),
        )
        pet.save()   # emoji auto-set in model.save()
        return Response(PetSerializer(pet).data, status=201)


class PetItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get(self, pk, user):
        try:
            return Pet.objects.get(pk=pk, user=user)
        except Pet.DoesNotExist:
            return None

    def put(self, request, pk):
        pet = self._get(pk, request.user)
        if not pet:
            return Response({'detail': 'Not found.'}, status=404)
        pet.name = request.data.get('name', pet.name)
        pet.pet_type = request.data.get('type', pet.pet_type)
        pet.breed = request.data.get('breed', pet.breed)
        pet.age = request.data.get('age', pet.age)
        pet.save()
        return Response(PetSerializer(pet).data)

    def delete(self, request, pk):
        pet = self._get(pk, request.user)
        if not pet:
            return Response({'detail': 'Not found.'}, status=404)
        pet.delete()
        return Response(status=204)


# ── Cart ──────────────────────────────────────────────────────────────────────

class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = CartItem.objects.filter(user=request.user).order_by('created_at')
        return Response(CartItemSerializer(items, many=True).data)

    def post(self, request):
        data = request.data
        pid = data.get('product_id')
        if not pid:
            return Response({'detail': 'product_id is required.'}, status=400)

        item, created = CartItem.objects.get_or_create(
            user=request.user,
            product_id=pid,
            defaults={
                'product_name': data.get('product_name', ''),
                'product_price': data.get('product_price', 0),
                'product_emoji': data.get('product_emoji', ''),
                'product_category': data.get('product_category', ''),
                'quantity': data.get('quantity', 1),
            }
        )
        if not created:
            item.quantity += int(data.get('quantity', 1))
            item.save()

        return Response(CartItemSerializer(item).data, status=201 if created else 200)

    def delete(self, request):
        """Clear entire cart."""
        CartItem.objects.filter(user=request.user).delete()
        return Response(status=204)


class CartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get(self, pk, user):
        try:
            return CartItem.objects.get(pk=pk, user=user)
        except CartItem.DoesNotExist:
            return None

    def put(self, request, pk):
        item = self._get(pk, request.user)
        if not item:
            return Response({'detail': 'Not found.'}, status=404)
        qty = int(request.data.get('quantity', 1))
        if qty < 1:
            item.delete()
            return Response(status=204)
        item.quantity = qty
        item.save()
        return Response(CartItemSerializer(item).data)

    def delete(self, request, pk):
        item = self._get(pk, request.user)
        if not item:
            return Response({'detail': 'Not found.'}, status=404)
        item.delete()
        return Response(status=204)


# ── Wishlist ──────────────────────────────────────────────────────────────────

class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = WishlistItem.objects.filter(user=request.user).order_by('created_at')
        return Response(WishlistItemSerializer(items, many=True).data)

    def post(self, request):
        data = request.data
        pid = data.get('product_id')
        if not pid:
            return Response({'detail': 'product_id is required.'}, status=400)

        if WishlistItem.objects.filter(user=request.user, product_id=pid).exists():
            return Response({'detail': 'Already in wishlist.'}, status=400)

        item = WishlistItem.objects.create(
            user=request.user,
            product_id=pid,
            product_name=data.get('product_name', ''),
            product_price=data.get('product_price', 0),
            product_original_price=data.get('product_original_price', 0),
            product_emoji=data.get('product_emoji', ''),
            product_category=data.get('product_category', ''),
            in_stock=data.get('in_stock', True),
        )
        return Response(WishlistItemSerializer(item).data, status=201)


class WishlistItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            WishlistItem.objects.get(pk=pk, user=request.user).delete()
            return Response(status=204)
        except WishlistItem.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)


# ── Admin endpoints ───────────────────────────────────────────────────────────

class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from products.models import Product
        total_products = Product.objects.using('products_db').count()
        in_stock = Product.objects.using('products_db').filter(in_stock=True).count()
        total_users = User.objects.count()
        cart_items = CartItem.objects.count()
        wishlist_items = WishlistItem.objects.count()

        return Response({
            'total_products': total_products,
            'in_stock': in_stock,
            'out_of_stock': total_products - in_stock,
            'total_users': total_users,
            'cart_items': cart_items,
            'wishlist_items': wishlist_items,
        })


class AdminUsersView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = []
        for u in User.objects.all().order_by('-date_joined'):
            profile = getattr(u, 'profile', None)
            users.append({
                'id': u.id,
                'name': u.get_full_name(),
                'email': u.email,
                'phone': profile.phone if profile else '',
                'is_staff': u.is_staff,
                'is_active': u.is_active,
                'date_joined': u.date_joined.strftime('%d %b %Y'),
                'cart_count': u.cart_items.count(),
                'wishlist_count': u.wishlist_items.count(),
            })
        return Response(users)


class AdminUserDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def _get_user(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def put(self, request, pk):
        u = self._get_user(pk)
        if not u:
            return Response({'detail': 'Not found.'}, status=404)

        data = request.data
        if 'name' in data:
            parts = data['name'].strip().split(' ', 1)
            u.first_name = parts[0]
            u.last_name = parts[1] if len(parts) > 1 else ''
        if 'is_staff' in data:
            u.is_staff = bool(data['is_staff'])
        if 'is_active' in data:
            u.is_active = bool(data['is_active'])
        u.save()

        profile, _ = UserProfile.objects.get_or_create(user=u)
        if 'phone' in data:
            profile.phone = data['phone']
            profile.save()

        return Response({
            'id': u.id,
            'name': u.get_full_name(),
            'email': u.email,
            'phone': profile.phone,
            'is_staff': u.is_staff,
            'is_active': u.is_active,
            'date_joined': u.date_joined.strftime('%d %b %Y'),
            'cart_count': u.cart_items.count(),
            'wishlist_count': u.wishlist_items.count(),
        })

    def delete(self, request, pk):
        u = self._get_user(pk)
        if not u:
            return Response({'detail': 'Not found.'}, status=404)
        if u == request.user:
            return Response({'detail': 'You cannot delete your own account.'}, status=400)
        u.delete()
        return Response(status=204)
