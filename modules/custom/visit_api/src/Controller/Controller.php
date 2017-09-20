<?php

namespace Drupal\visit_api\Controller;

use Drupal\Core\Controller\ControllerBase;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Drupal\Core\Database\Database;

class Controller extends ControllerBase {

    const URL = 'https://78xrvxra6b.execute-api.us-west-2.amazonaws.com/Firehose';

    /**
     * Creates a visit in the db of visit api
     */
    public function postVisit(Request $request) {

        $client = new \GuzzleHttp\Client();
        $headers['Content-Type'] = 'application/json';
        $apiValues = $this->fetchAPIValuesFromDatabase();
        if(!isset($apiValues['visit_api_key']) || !isset($apiValues['publisher_name'])) {
            \Drupal::logger('visit_api')->notice('API key not set. Please add a key value in the visit_api table.');
            return new Response('API key not set. Please add a key value in the visit_api table.');
        }
        $headers['x-api-key'] = $apiValues['visit_api_key'];
        $url =  self::URL;
        $body = $request->getContent(false);
        $bodyJSON = json_encode($body);

        $bodyJSON = str_replace("milestone",'publisher\\":\\"'. $apiValues['publisher_name'] .'\\",\\"milestone',$bodyJSON);
        $decoded = json_decode($bodyJSON);

        //  $tempArr['publisher'] = $apiValues['publisher_name'];
        //$bodyJSON .= "\"publisher\":\"samples\"";
      //  \Drupal::logger('visit_api')->notice($decoded);
        try {
            $res = $client->post($url, [
                'http_errors' => false,
                'headers' => $headers,
                'body' => $decoded
            ]);
        } catch (RequestException $e) {
            return new Response($e);
        }
        return $res;
    }

    /*
     * Function to return the API key value from visit_api table
     */
    private function fetchAPIValuesFromDatabase(){
        $conn = Database::getConnection();
        $record = array();
        $query = $conn->select('visit_api', 'm')
            ->orderBy('id', 'DESC')
            ->fields('m');
        $record = $query->execute()->fetchAssoc();
        return $record;
    }
}