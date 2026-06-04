async function test() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLXlqNXBjX0xBUkNfQWdLNjEiLCJpYXQiOjE2NDE3OTk5NDl9.flEMaQ7zsdYkxuyGbiXjEDXO8kuDTcI__3UjCwt6R_I'; // from documentation mock

  const payload = {
    endpoint: "https://fcm.googleapis.com/fcm/send/foo",
    keys: {
      p256dh: "p256dh_mock_key",
      auth: "auth_mock_key"
    }
  };

  const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log("Response with keys object:", text);

  const payloadFlat = {
    endpoint: "https://fcm.googleapis.com/fcm/send/foo2",
    keys: "somekey",
    p256dh: "p256dh_mock_key",
    auth: "auth_mock_key"
  };

  const response2 = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payloadFlat)
  });

  const text2 = await response2.text();
  console.log("Response with flat object:", text2);
}

test();
