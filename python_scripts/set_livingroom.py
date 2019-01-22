lamp_state = data.get('lamp') == 'True'
hue_state = data.get('hue')

LIVINGROOM_WARM = {'color_temp': 331}
HUE_LOOKUP = {
    'warm': LIVINGROOM_WARM
}

FULL_BRIGHTNESS = 255
OFF = 0

ENTITY_LIVINGROOM_HUE = 'light.living_room'

logger.info('Set lamp: %s, hue: %s' % (lamp_state, hue_state))

# Set kmc smart plug
kmc_event_name = 'livingroom_%s' % ('on' if lamp_state else 'off')
hass.services.call('ifttt', 'trigger', {'event': kmc_event_name}, False)

# Set hue
hue_state['brightness'] = int(hue_state['brightness'])
if hue_state['brightness'] > 0:
    hue_service_data = {'entity_id': ENTITY_LIVINGROOM_HUE, 'brightness': hue_state['brightness']}
    if 'color' in hue_state:
        hue_service_data.update(HUE_LOOKUP[hue_state['color']])
    hass.services.call('light', 'turn_on', hue_service_data)
else:
    hass.services.call('light', 'turn_off', {'entity_id': ENTITY_LIVINGROOM_HUE})