# Generated by Django 5.1.5 on 2025-02-07 11:23

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('hospital', '0007_alter_appointment_unique_together'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='appointment',
            unique_together=set(),
        ),
    ]
