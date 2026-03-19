from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings


def send_email(subject: str, to: list, template: str, context: dict = None):
    """
    Reusable utility to send HTML + text fallback emails.

    Args:
        subject (str): Email subject
        to (list): List of recipient emails
        template (str): Template path (e.g. "emails/msme_status_change.html")
        context (dict): Variables to pass to the template
    """
    print(f"SENDING EMAIL TO THEM")
    context = context or {}

    # Render email template
    html_content = render_to_string(template, context)
    text_content = strip_tags(html_content)

    # Build email
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=to
    )

    email.attach_alternative(html_content, "text/html")

    # Send email safely
    try:
        email.send(fail_silently=False)
        print(f"Email sent to {', '.join(to)}")
        return True
    except Exception as e:
        print(f"Email error ({', '.join(to)}): {e}")
        return False