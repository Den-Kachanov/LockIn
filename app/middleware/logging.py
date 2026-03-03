import logging
import time

logger = logging.getLogger("lockin")
logger.setLevel(logging.INFO)

handler = logging.FileHandler("app.log")
# log format
formatter = logging.Formatter(
    "%(asctime)s %(levelname)s %(message)s"
)
handler.setFormatter(formatter)

if not logger.handlers:
    logger.addHandler(handler)


class LoggingMiddleware:
    """
    Middleware to log
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start = time.perf_counter()

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                duration = time.perf_counter() - start

                method = scope.get("method")
                path = scope.get("path")
                status = message.get("status")

                client = scope.get("client")
                ip = client[0] if client else "-"

                logger.info(
                    "%s %s %s %s %.4fs",
                    ip,
                    method,
                    path,
                    status,
                    duration,
                )

            await send(message)

        await self.app(scope, receive, send_wrapper)

# Purchase-specific logger
purchase_logger = logging.getLogger("purchases")
purchase_logger.setLevel(logging.INFO)

# File handler
purchase_handler = logging.FileHandler("purchases.log")
purchase_handler.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter(
    "%(asctime)s - USER: %(username)s - PURCHASE_ID: %(purchase_id)s - %(message)s"
)
purchase_handler.setFormatter(formatter)

# Add handler to logger
purchase_logger.addHandler(purchase_handler)
