"""Config flow for Cork Dork."""

from __future__ import annotations

import logging
from typing import Any

import aiohttp
import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, OptionsFlow
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    AI_PROVIDERS,
    CONF_AI_API_KEY,
    CONF_AI_BASE_URL,
    CONF_AI_MODEL,
    CONF_AI_PROVIDER,
    CONF_GEMINI_API_KEY,
    CONF_GEMINI_MODEL,
    DEFAULT_AI_PROVIDER,
    DEFAULT_GEMINI_MODEL,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


class WineCellarConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Cork Dork."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            return self.async_create_entry(
                title="Cork Dork",
                data=user_input,
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({}),
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> WineCellarOptionsFlow:
        """Get the options flow."""
        return WineCellarOptionsFlow()


class WineCellarOptionsFlow(OptionsFlow):
    """Handle options flow for Cork Dork."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage options."""
        errors: dict[str, str] = {}

        if user_input is not None:
            errors = await self._async_validate_ai_provider(user_input)
            if not errors:
                return self.async_create_entry(title="", data=user_input)

        # On validation errors re-show the form with the entered values so
        # the user can correct them without retyping everything.
        current = user_input if user_input is not None else self.config_entry.options

        return self.async_show_form(
            step_id="init",
            errors=errors,
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        "default_wine_type",
                        default=current.get("default_wine_type", "red"),
                    ): vol.In(["red", "white", "rosé", "sparkling", "dessert"]),
                    vol.Optional(
                        CONF_AI_PROVIDER,
                        default=current.get(CONF_AI_PROVIDER, DEFAULT_AI_PROVIDER),
                    ): vol.In(AI_PROVIDERS),
                    vol.Optional(
                        CONF_GEMINI_API_KEY,
                        default=current.get(CONF_GEMINI_API_KEY, ""),
                    ): str,
                    vol.Optional(
                        CONF_GEMINI_MODEL,
                        default=current.get(CONF_GEMINI_MODEL, DEFAULT_GEMINI_MODEL),
                    ): str,
                    vol.Optional(
                        CONF_AI_BASE_URL,
                        default=current.get(CONF_AI_BASE_URL, ""),
                    ): str,
                    vol.Optional(
                        CONF_AI_API_KEY,
                        default=current.get(CONF_AI_API_KEY, ""),
                    ): str,
                    vol.Optional(
                        CONF_AI_MODEL,
                        default=current.get(CONF_AI_MODEL, ""),
                    ): str,
                }
            ),
        )

    async def _async_validate_ai_provider(
        self, user_input: dict[str, Any]
    ) -> dict[str, str]:
        """Test an OpenAI-compatible endpoint before saving. Returns form errors."""
        if user_input.get(CONF_AI_PROVIDER) != "openai_compatible":
            return {}

        base_url = (user_input.get(CONF_AI_BASE_URL) or "").strip()
        api_key = (user_input.get(CONF_AI_API_KEY) or "").strip()
        model = (user_input.get(CONF_AI_MODEL) or "").strip()

        if not base_url or not api_key or not model:
            return {"base": "ai_provider_incomplete"}

        # Only re-verify when the endpoint/key actually changed, to avoid a
        # network round-trip on every unrelated options save.
        options = self.config_entry.options
        if (
            base_url == options.get(CONF_AI_BASE_URL)
            and api_key == options.get(CONF_AI_API_KEY)
        ):
            return {}

        # Test the exact endpoint the client will actually use — some relays
        # hand out the full /v1/chat/completions URL to paste as-is (with a
        # per-account path segment), so a guessed /v1/models path can 404
        # even when the real chat endpoint works fine.
        from .gemini import resolve_openai_chat_endpoint

        chat_url = resolve_openai_chat_endpoint(base_url)
        session = async_get_clientsession(self.hass)
        try:
            timeout = aiohttp.ClientTimeout(total=10)
            async with session.post(
                chat_url,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": "ping"}],
                    "max_tokens": 1,
                },
                timeout=timeout,
            ) as resp:
                if resp.status in (401, 403):
                    return {"base": "ai_provider_invalid_auth"}
                if resp.status >= 500:
                    _LOGGER.warning(
                        "AI provider connectivity check failed: HTTP %s", resp.status
                    )
                    return {"base": "ai_provider_cannot_connect"}
                # Any other response (200, or a 4xx from the model rejecting
                # the trivial ping prompt) still proves the endpoint and
                # auth are reachable — good enough to save.
        except Exception:  # noqa: BLE001 - surface as a form error, not a crash
            _LOGGER.exception("Unexpected error verifying AI provider endpoint")
            return {"base": "ai_provider_cannot_connect"}

        return {}
