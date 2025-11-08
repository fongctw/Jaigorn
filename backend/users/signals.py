from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from wallets.models import WalletAccount

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_wallet_account_for_new_user(sender, instance, created, **kwargs):

    if created:
        WalletAccount.objects.create(user=instance, credit_limit=2000.00)
        print(f"WalletAccount with 2000 credit limit created for new user: {instance.email}")
