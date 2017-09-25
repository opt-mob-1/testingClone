<?php

namespace Drupal\visitor_api\Controller;

use Drupal\Core\Controller\ControllerBase;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Database\Database;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class Controller extends ControllerBase {

    /**
     * Retrieves information about a Visitor with id(eg. 275a6f4b-8444-11e7-9111-97ae882b5aaf)
     */
    public function getVisitor($visitorId) {
        $client = new \GuzzleHttp\Client();
        $headers['Accept'] = 'application/json';
        $apiValues = $this->fetchAPIValuesFromDatabase();
        if(!isset($apiValues['visitor_api_key']) || !isset($apiValues['publisher_name'])) {
            \Drupal::logger('visitor_api')->notice('API key not set. Please add a key value in the visitor_api table.');
            return new Response('API key not set. Please add a key value in the visitor_api table.');
        }
        $headers['x-api-key'] = $apiValues['visitor_api_key'];
        $url =  $apiValues['visitor_api_url'] . '/' . $visitorId;
        try {
            $res = $client->get($url, [
                'http_errors' => false,
                'headers' => $headers
            ]);
        } catch (RequestException $e) {
            return new Response($e);
        }

        return $res;
    }

    /**
     * Retrieves information about a Visitor with emai
     */
    public function getVisitorByEmail($email) {
        $client = new \GuzzleHttp\Client();
        $headers['Accept'] = 'application/json';
        $apiValues = $this->fetchAPIValuesFromDatabase();
        if(!isset($apiValues['visitor_api_key']) || !isset($apiValues['publisher_name'])) {
            \Drupal::logger('visitor_api')->notice('API key not set. Please add a key value in the visitor_api table.');
            return new Response('API key not set. Please add a key value in the visitor_api table.');
        }
        $headers['x-api-key'] = $apiValues['visitor_api_key'];
        $url =  $apiValues['visitor_api_url'] . '/' . $email;
        try {
            $res = $client->get($url, [
                'http_errors' => false,
                'headers' => $headers
            ]);
        } catch (RequestException $e) {
            return new Response($e);
        }
        return $res;
    }


    /**
     * Creates a visitor in the db of visitors api
     */
    public function postVisitor(Request $request) {

        $client = new \GuzzleHttp\Client();
        $headers['Accept'] = 'application/json';
        $apiValues = $this->fetchAPIValuesFromDatabase();
        if(!isset($apiValues['visitor_api_key']) || !isset($apiValues['publisher_name'])) {
            \Drupal::logger('visitor_api')->notice('API key not set. Please add a key value in the visitor_api table.');
            return new Response('API key not set. Please add a key value in the visitor_api table.');
        }
        $headers['x-api-key'] = $apiValues['visitor_api_key'];
        $url =  $apiValues['visitor_api_url'];

       // print_r(json_decode($request->getContent()));
       // die();
        try {
            $res = $client->post($url, [
                'http_errors' => false,
                'headers' => $headers,
                'body' => $request->getContent()
            ]);
        } catch (RequestException $e) {
            return new Response($e);
        }
        return $res;
    }

    /**
     * Updates a visitors data using the users previously generated id
     */
    public function updateVisitor($visitorId, Request $request) {
        $client = new \GuzzleHttp\Client();
        $headers['Accept'] = 'application/json';
        $apiValues = $this->fetchAPIValuesFromDatabase();
        if(!isset($apiValues['visitor_api_key']) || !isset($apiValues['publisher_name'])) {
            \Drupal::logger('visitor_api')->notice('API key not set. Please add a key value in the visitor_api table.');
            return new Response('API key not set. Please add a key value in the visitor_api table.');
        }
        $headers['x-api-key'] = $apiValues['visitor_api_key'];
        $url =  $apiValues['visitor_api_url'] . '/' . $visitorId;

        try {
            $res = $client->put($url, [
                'http_errors' => false,
                'headers' => $headers,
                'body' => $request->getContent()
            ]);
        } catch (RequestException $e) {
            return new Response($e);
        }
        return $res;
    }

    /*
     * Function to return the API key value from visitor_api table
     */
    private function fetchAPIValuesFromDatabase(){
        $conn = Database::getConnection();
        $record = array();
        $query = $conn->select('visitor_api', 'm')
            ->orderBy('id', 'DESC')
            ->fields('m');
        $record = $query->execute()->fetchAssoc();
        return $record;
    }
}