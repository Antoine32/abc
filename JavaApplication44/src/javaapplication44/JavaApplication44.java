package javaapplication44;


import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import org.java_websocket.WebSocket;
import org.java_websocket.drafts.Draft;
import org.java_websocket.exceptions.InvalidDataException;
import org.java_websocket.framing.CloseFrame;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.handshake.ServerHandshakeBuilder;
import org.java_websocket.server.WebSocketServer;

/**
 *
 * @author antoi
 */
public class JavaApplication44 extends WebSocketServer {

    private long time = System.currentTimeMillis();
    
    public static void main(String args[]) {
        JavaApplication44 abc = new JavaApplication44(new InetSocketAddress("127.0.0.1", 8989));
        abc.setTcpNoDelay(true);
        abc.start();
    }

    public JavaApplication44(InetSocketAddress address) {
        super(address);
    }

    @Override
    public ServerHandshakeBuilder onWebsocketHandshakeReceivedAsServer(WebSocket conn, Draft draft, ClientHandshake request) throws InvalidDataException {
        ServerHandshakeBuilder builder = super.onWebsocketHandshakeReceivedAsServer(conn, draft, request);

        if (System.currentTimeMillis() - time < 500) {
            time = System.currentTimeMillis();
            throw new InvalidDataException(CloseFrame.POLICY_VALIDATION, "Not accepted!");
        }

        return builder;
    }

    @Override
    @SuppressWarnings("empty-statement")
    public void onOpen(WebSocket conn, ClientHandshake handshake) {

        long wait = System.currentTimeMillis();
        while (System.currentTimeMillis() - wait < 100);
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        broadcast(message);
    }

    @Override
    public void onMessage(WebSocket conn, ByteBuffer message) {
        broadcast(message);
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
    }

    @Override
    public void onStart() {
    }
}
