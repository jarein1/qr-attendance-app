document.getElementById('scan-qr').addEventListener('click', function() {
    // Check if the browser supports the WebRTC API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Sorry, your browser does not support accessing the camera.');
      return;
    }
    
    // Request access to the camera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(function(stream) {
        // Create a video element to stream the camera feed
        var video = document.createElement('video');
        video.srcObject = stream;
        video.setAttribute('autoplay', '');
        video.setAttribute('playsinline', '');
        document.body.appendChild(video);
        
        // Create a canvas element to capture the image from the video stream
        var canvas = document.createElement('canvas');
        canvas.style.display = 'none'; // Hide the canvas
        document.body.appendChild(canvas);
        
        // Create a context for the canvas
        var context = canvas.getContext('2d');
        var scanning = true;
        
        // Function to continuously scan for QR codes
        function scanQR() {
          if (!scanning) return;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          // Decode QR codes using jsQR library
          var code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            scanning = false; // Stop scanning
            
            // Send the QR code data to the server
            // fetch('http://abc.com/api/sendinfo', {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json'
            //   },
            //   body: JSON.stringify({ qrData: code.data })
            // })
            // .then(function(response) {
            //   if (response.ok) {
            //     alert('QR code scanned successfully!');
            //   } else {
            //     alert('Failed to send QR code data to the server.');
            //   }
            // })
            // .catch(function(error) {
            //   alert('An error occurred while sending QR code data: ' + error.message);
            // });
          } else {
            requestAnimationFrame(scanQR); // Continue scanning
          }
        }
        
        // Start scanning for QR codes
        scanQR();
      })
      .catch(function(error) {
        alert('Unable to access the camera: ' + error.message);
      });
  });