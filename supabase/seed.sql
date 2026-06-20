-- Crea el viaje y genera el slug secreto que le pasás a tu amigo.
-- Corré esto UNA vez (vos, como dueño). El slug debe ser de alta entropía.
-- Ejemplo: encode(gen_random_bytes(9), 'base64') -> ~12 chars url-safe.

insert into public.trips (slug, titulo)
values (
  replace(replace(encode(gen_random_bytes(9), 'base64'), '/', '_'), '+', '-'),
  'Nos vemos en Macau'
)
returning slug;  -- <- este es el link: /viaje/<slug>
